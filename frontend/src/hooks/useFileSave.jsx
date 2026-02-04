import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function useFileSave({
    BASE_URL,
    showToast,
    generateFileName
}) {
    const { user, hasRole } = useAuth();
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
        file,
        existingAttachments = [], // Existing attachments from forwarded files
        stayOnPage = false // New: if true, don't navigate away (for DESK users with DRAFT files)
    }) => {
        e.preventDefault();

        // Check if user is Inward Desk ONLY (skip validation for file_subject)
        // Users with multiple roles (e.g., INWARD + DESK) should use full validation
        const isInwardDesk = hasRole('INWARD') && !hasRole('DESK');

        try {
            const file_subject = document.getElementById("file_subject")?.value;
            // Only require file_subject for non-Inward Desk users
            if (!isInwardDesk && !file_subject) {
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
            formDatas.append("created_by_user_id", user?.user?.id); // Track who created the file
            formDatas.append("role_code", isInwardDesk ? 'INWARD' : (user?.user?.role_code || "")); // For Inward Desk detection - only pure INWARD users

            // Include existing attachment IDs from forwarded files
            console.log('=== DEBUG: Existing Attachments ===');
            console.log('existingAttachments:', existingAttachments);
            if (existingAttachments && existingAttachments.length > 0) {
                const attachmentIds = existingAttachments.map(att => att.id).filter(id => id);
                console.log('Extracted attachment IDs:', attachmentIds);
                formDatas.append("existing_attachment_ids", JSON.stringify(attachmentIds));
            } else {
                console.log('No existing attachments to link');
            }

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

            // Display success message with Document ID
            const documentIdMessage = result.document_id
                ? `Document ID: ${result.document_id}`
                : "";
            showToast("File created (Draft)", documentIdMessage, "success");

            // If stayOnPage is true (DESK users with DRAFT), don't navigate away
            // Return the result so caller can update state and stay on page
            if (stayOnPage) {
                return { success: true, result };
            }

            // navigate(`/fileinbox`);
            navigate("/fileinbox", {
                state: { activeTab: "created" }
            });

            return { success: true, result };


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
        if (e) e.preventDefault();

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
                        fromDepartment: user?.user?.department,
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