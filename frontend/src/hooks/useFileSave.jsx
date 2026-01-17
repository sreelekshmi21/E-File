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
        setFileNumber,
        formData,
        file
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

            const formDatas = new FormData();
            formDatas.append("file_no", file_no);
            formDatas.append("file_id", file_id);
            formDatas.append("fileName", file_id);
            formDatas.append("file_subject", file_subject);
            formDatas.append("sender", user?.user?.department);
            formDatas.append("current_status", user?.user?.department);
            formDatas.append("status", "DRAFT");
            formDatas.append("department", selectedDepartment?.value);
            formDatas.append("division", selectedDivision?.value);
            formDatas.append("unit", selectedUnit?.value);
            formDatas.append("remarks", formData?.remarks || "");

            /* Attachments */
            // const files = document.getElementById("file")?.files || [];
            // for (let f of files) formDatas.append("file", f);

            for (let f of file) formDatas.append("file", f);
            const res = await fetch(`${BASE_URL}/createfilewithattachments`, {
                method: "POST",
                body: formDatas
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
            // navigate(`/fileinbox`);
            navigate("/fileinbox", {
                state: { activeTab: "created" }
            });

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
        selectedReceiver,
        selectedSection,
        selectedUser
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

        console.log("Sending to:", selectedReceiver.value, selectedSection?.value, selectedUser?.value);

        try {
            const res = await fetch(
                `${BASE_URL}/api/files/${fileToEdit.id}/send`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        toDepartment: selectedReceiver.value,
                        targetSection: selectedSection?.value || null,
                        targetUserId: selectedUser?.value || null
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
                    forwarded_to: selectedReceiver.value,
                    target_section: selectedSection?.value || null,
                    target_user_id: selectedUser?.value || null,
                    target_username: selectedUser?.label || null
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