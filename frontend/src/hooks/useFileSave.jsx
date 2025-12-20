import { useNavigate } from "react-router-dom";

export default function useFileSave({
    BASE_URL,
    user,
    showToast,
    generateFileName
}) {
    const navigate = useNavigate();

    // if (typeof generateFileName === "function") {
    //     const generatedFileName = generateFileName();
    // }

    let file_subject;
    const handleSave = async ({
        e,
        mode,
        formData = {},
        fileToEdit,
        selectedDepartment,
        selectedReceiver = null,
        selectedDivision = null,
        selectedUnit = null,
        approvalStatus = 'pending',
        fileName = '',
        setFileNumber = () => { }
    }) => {
        e.preventDefault();

        console.log("selectedDepartment:", selectedDepartment);

        const isEditing = Boolean(fileToEdit?.id);
        const formDatas = new FormData();

        /* ---------------- FILE NUMBER ---------------- */
        let file_no = document.getElementById("file_no")?.value;

        if (!isEditing) {
            try {
                const res = await fetch(`${BASE_URL}/api/generate-file-number`, {
                    method: "POST"
                });
                const data = await res.json();
                file_no = data.fileNumber;
                setFileNumber(file_no);

                const generatedFileName = generateFileName();
                if (generatedFileName) {
                    fileName = generatedFileName;
                }
            } catch (err) {
                showToast("Error generating file number", "", "danger");
                return;
            }
        }

        /* ---------------- BASIC FIELDS ---------------- */
        const file_id = fileName || document.getElementById("file_id")?.value;
        file_subject = document.getElementById("file_subject")?.value;

        if (mode === "create") {
            if (!file_id || !file_subject) {
                showToast("All fields are required.", "", "danger");
                return;
            }
        }

        formDatas.append("fileName", file_id);
        formDatas.append("file_no", file_no);
        formDatas.append("file_id", file_id);
        formDatas.append("file_subject", file_subject);
        formDatas.append("sender", user?.user?.department || selectedDepartment?.value || fileToEdit?.sender);
        formDatas.append("receiver", selectedReceiver?.value);
        formDatas.append("current_status", selectedDepartment?.value || fileToEdit?.current_status);
        formDatas.append("remarks", formData?.remarks || "");
        formDatas.append(
            "status",
            approvalStatus === undefined ? "pending" : approvalStatus
        );
        formDatas.append("department", selectedDepartment?.value || fileToEdit?.department);
        formDatas.append("division", selectedDivision?.value || fileToEdit?.division);
        formDatas.append("unit", selectedUnit?.value || fileToEdit?.unit);

        /* ---------------- ATTACHMENTS ---------------- */
        const files = document.getElementById("file")?.files || [];
        for (let i = 0; i < files.length; i++) {
            formDatas.append("file", files[i]);
        }

        /* ---------------- AUDIT LOG ---------------- */
        const logEvent = async (eventType, forwardedTo = "") => {
            const payload = {
                event_type: eventType,
                file_id: fileToEdit?.id,
                user_id: user?.user?.id,
                origin: selectedDepartment?.value || "",
                forwarded_to: forwardedTo,
                approved_by: user?.user?.username || "",
                edited_by: user?.user?.username || ""
            };

            await fetch(`${BASE_URL}/api/file-events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        };

        /* ---------------- SAVE / UPDATE ---------------- */
        try {
            const url = isEditing
                ? `${BASE_URL}/createfilewithattachments/${fileToEdit.id}`
                : `${BASE_URL}/createfilewithattachments`;

            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, { method, body: formDatas });
            const result = await res.json();

            if (!res.ok) {
                showToast(result.error || "Error occurred", "", "danger");
                return;
            }

            if (isEditing) {
                await logEvent("edited", fileToEdit?.receiver);
                if (approvalStatus === "approved") {
                    await logEvent("approved", fileToEdit?.receiver);
                }
                showToast("File updated successfully", "", "success");
            } else {
                await fetch(`${BASE_URL}/api/file-events`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        event_type: "created",
                        file_id: result.id,
                        user_id: user?.user?.id,
                        origin: selectedDepartment?.value || "",
                        forwarded_to: selectedReceiver?.value || ""
                    })
                });
                showToast("File created successfully", "", "success");
            }

            navigate("/fileinbox");
        } catch (err) {
            console.error(err);
            showToast("Failed to upload file", "", "danger");
        }
        if (mode === "send") {
            // View page uses existing file data
            file_subject = fileToEdit?.file_subject
        }
    };

    return { handleSave };
}