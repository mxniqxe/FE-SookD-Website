export function getSessionId(): string {

    let sessionId =
        sessionStorage.getItem("guestId");

    if (!sessionId) {

        sessionId = crypto.randomUUID();

        sessionStorage.setItem(
            "guestId",
            sessionId
        );

    }
    console.log(sessionId);

    return sessionId;

}