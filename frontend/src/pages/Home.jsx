import { useState } from "react";


const API_URL = "http://127.0.0.1:8001";


function Home() {

    const [text, setText] = useState("");
    const [questions, setQuestions] = useState([]);
    const [answer, setAnswer] = useState("");
    const [selectedQuestion, setSelectedQuestion] = useState("");
    const [error, setError] = useState("");

    const serviceId = localStorage.getItem("service_id");

    const serviceNames = {
        "1": "Электробезопасность",
        "2": "Пожарная безопасность",
        "3": "Охрана труда"
    };

    const serviceName =
        serviceNames[serviceId] || "Служба не определена";


    async function search(e) {

        const value = e.target.value;

        setText(value);
        setAnswer("");
        setSelectedQuestion("");
        setError("");


        if (value.length < 2) {
            setQuestions([]);
            return;
        }


        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/questions/suggest?q=${value}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            if (!response.ok) {
                throw new Error("Ошибка поиска");
            }


            const data = await response.json();

            setQuestions(data);


        } catch (err) {

            setError(err.message);

        }

    }


    async function getAnswer(id, question) {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/questions/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            if (!response.ok) {
                throw new Error("Ошибка получения ответа");
            }


            const data = await response.json();

            setSelectedQuestion(question);
            setAnswer(data.answer);
            setQuestions([]);


        } catch (err) {

            setError(err.message);

        }

    }


    function resetSearch() {

        setText("");
        setQuestions([]);
        setAnswer("");
        setSelectedQuestion("");
        setError("");

    }


    return (

        <div className="container">

            <div
                style={{
                    textAlign: "center",
                    marginBottom: "24px"
                }}
            >

                <h1>
                    TestMaster
                </h1>

                <div
                    style={{
                        display: "inline-block",
                        background: "#eff6ff",
                        color: "#1e40af",
                        padding: "8px 14px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "600"
                    }}
                >
                    {serviceName}
                </div>

            </div>


            <h2>
                Найдите вопрос
            </h2>


            <input
                value={text}
                onChange={search}
                placeholder="Введите часть вопроса..."
            />


            {
                error &&

                <p
                    style={{
                        color: "#dc2626",
                        textAlign: "center"
                    }}
                >
                    {error}
                </p>
            }


            {
                questions.length > 0 &&

                <div
                    style={{
                        marginTop: "14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px"
                    }}
                >

                    {
                        questions.map(q => (

                            <button
                                key={q.id}
                                onClick={() =>
                                    getAnswer(q.id, q.question)
                                }
                                style={{
                                    width: "100%",
                                    textAlign: "left",
                                    background: "#f8fafc",
                                    color: "#111827",
                                    border: "1px solid #e2e8f0"
                                }}
                            >
                                {q.question}
                            </button>

                        ))
                    }

                </div>
            }


            {
                answer &&

                <div
                    style={{
                        marginTop: "24px",
                        padding: "20px",
                        border: "2px solid #16a34a",
                        borderRadius: "14px",
                        background: "#f0fdf4"
                    }}
                >

                    <div
                        style={{
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#166534",
                            marginBottom: "8px"
                        }}
                    >
                        ВОПРОС
                    </div>

                    <div
                        style={{
                            fontSize: "18px",
                            lineHeight: "1.4",
                            marginBottom: "20px"
                        }}
                    >
                        {selectedQuestion}
                    </div>


                    <div
                        style={{
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#166534",
                            marginBottom: "8px"
                        }}
                    >
                        ✓ ПРАВИЛЬНЫЙ ОТВЕТ
                    </div>


                    <div
                        style={{
                            fontSize: "26px",
                            fontWeight: "700",
                            marginBottom: "20px"
                        }}
                    >
                        {answer}
                    </div>


                    <button
                        onClick={resetSearch}
                        style={{
                            width: "100%"
                        }}
                    >
                        Новый поиск
                    </button>

                </div>
            }

        </div>

    );

}


export default Home;