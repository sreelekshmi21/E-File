import { useNavigate } from "react-router-dom";

export default function useFileSave({
    BASE_URL,
    user,
    showToast,
    generateFileName
}) {
    const navigate = useNavigate();

    /* ---------------------------------
       CREATE FILE (Draft)
    --------------------------------- */
    const handleCreateFile = async ({
        e,
        selectedDepartment,
        selectedDivision,
        selectedUnit,
        setFileNumber
    }) => {
        e.preventDefault();

        try {
            const file_subject = document.getElementById("file_subject")?.value;
            if (!file_subject) {
                showToast("File subject is required", "", "danger");
                return;
            }

            /* Generate file number */
            const fileNoRes = await fetch(`${BASE_URL}/api/generate-file-number`, {
                method: "POST"
            });
            const fileNoData = await fileNoRes.json();
            const file_no = fileNoData.fileNumber;
            setFileNumber(file_no);

            const file_id = generateFileName();

            const formData = new FormData();
            formData.append("file_no", file_no);
            formData.append("file_id", file_id);
            formData.append("fileName", file_id);
            formData.append("file_subject", file_subject);
            formData.append("sender", user?.user?.department);
            formData.append("current_status", user?.user?.department);
            formData.append("status", "DRAFT");
            formData.append("department", selectedDepartment?.value);
            formData.append("division", selectedDivision?.value);
            formData.append("unit", selectedUnit?.value);

            /* Attachments */
            const files = document.getElementById("file")?.files || [];
            for (let f of files) formData.append("file", f);

            const res = await fetch(`${BASE_URL}/createfilewithattachments`, {
                method: "POST",
                body: formData
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message);

            /* Audit log */
            await fetch(`${BASE_URL}/api/file-events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_type: "created",
                    file_id: result.id,
                    user_id: user?.user?.id,
                    origin: selectedDepartment?.value
                })
            });

            showToast("File created (Draft)", "", "success");
            navigate(`/fileinbox`);

        } catch (err) {
            console.error(err);
            showToast("Failed to create file", "", "danger");
        }
    };

    /* ---------------------------------
       SEND FILE
    --------------------------------- */
    const handleSendFile = async ({
        e,
        fileToEdit,
        selectedReceiver
    }) => {
        e.preventDefault();

        if (!fileToEdit?.id) {
            showToast("Create file before sending", "", "warning");
            return;
        }

        if (!selectedReceiver?.value) {
            showToast("Select a department to send", "", "danger");
            return;
        }

        try {
            const res = await fetch(
                `${BASE_URL}/api/files/${fileToEdit.id}/send`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        toDepartment: selectedReceiver.value
                    })
                }
            );

            const result = await res.json();
            if (!res.ok) throw new Error(result.message);

            /* Audit log */
            await fetch(`${BASE_URL}/api/file-events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_type: "sent",
                    file_id: fileToEdit.id,
                    user_id: user?.user?.id,
                    origin: user?.user?.department,
                    forwarded_to: selectedReceiver.value
                })
            });

            showToast("File sent successfully", "", "success");
            navigate("/fileinbox");

        } catch (err) {
            console.error(err);
            showToast("Failed to send file", "", "danger");
        }
    };

    return {
        handleCreateFile,
        handleSendFile
    };
}