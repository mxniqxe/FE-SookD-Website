import { AdminChat } from "../../backend/models/AdminChat";
import { getSheetData } from "../../backend/services/googleSheetService";
import { generateNextId } from "../../backend/utils/idGenerator";

export async function getAdminChats(): Promise<AdminChat[]> {

    const data = await getSheetData("admin_chat");

    return data.map((item: any) => ({

        reference: item.reference,

        session_id: item.session_id,

        history: item.history,

        status: item.status,

        created_at: item.created_at

    }));

}

export async function createAdminChat(
    adminChat: Omit<AdminChat, "reference_id">
): Promise<AdminChat> {

    const adminChats =
        await getAdminChats();

    const referenceId =
        generateNextId(
            adminChats.map(c => c.reference_id),
            "SKD"
        );

    const newAdminChat: AdminChat = {

        reference_id: referenceId,

        ...adminChat

    };
    // console.log("newADmin",newAdminChat);

    const response = await fetch(process.env.GAS_URL!, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            action: "createAdminChat",
            data: newAdminChat
        })
    });

    const text = await response.text();
    console.log("GAS RESPONSE:", text);
    if (!response.ok) {
        throw new Error(
            "Failed to create admin chat"
        );
    }

    return newAdminChat;
}