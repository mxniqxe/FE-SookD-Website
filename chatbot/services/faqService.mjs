import Fuse from "fuse.js";
import { getSheetData } from "../../backend/services/googleSheetService";
// import { FAQ } from "../../backend/models/FAQ";

let faqFuse = null;
let lastUpdate = 0;

const ONE_DAY = 24 * 60 * 60 * 1000;

// ================= Get FAQ =================

export async function getFAQ() {

    const data = await getSheetData("faqs");
    // console.log("FAQ RAW:", data);

    return data.map(item => ({

        question: item.question,

        answer: item.answer

    }));

}

// ================= Create FAQ Fuse =================
export async function createFAQFuse() {

    const now = Date.now();

    if (
        faqFuse &&
        now - lastUpdate < ONE_DAY
    ) {
        return faqFuse;
    }

    // console.log("โหลด FAQ จาก Google Sheet");

    const faqData = await getFAQ();

    const formattedFAQ = faqData.map(faq => ({
        ...faq,
        question: faq.question.split("|")
    }));


    return new Fuse(
        formattedFAQ,
        {
            keys: [
                {
                    name: "question",
                    weight: 1
                }
            ],
            threshold: 0.2,
            ignoreLocation: true,
            includeScore: true
        }
    );
}


// ----------------- ตัดคำน้า -------------------
function normalizeFAQQuestion(question) {
    return question
        .replace(/จ้า|จ๊ะ|จ๋า|ครับ|ค่ะ|คับ/g, "")
        .trim();
}

// ================= Search FAQ =================

export function searchFAQ(
    fuse,
    question
) {
    question = normalizeFAQQuestion(question);

    const result =
        fuse.search(question);


    if (
        result.length === 0
    ) {

        return null;

    }


    return result[0].item.answer;

}