import { useState } from "react";

import {
    loginUser
} from "../api/client";


function Login() {


    const [form, setForm] = useState({
        email: "",
        password: ""
    });


    const [message, setMessage] = useState("");



    function change(e) {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    }



    async function submit(e) {

        e.preventDefault();


        const result = await loginUser(form);


        if (result.token) {

    localStorage.setItem(
        "token",
        result.token
    );

    localStorage.setItem(
        "service_id",
        result.service_id
    );

    localStorage.setItem(
        "user_id",
        result.user_id
    );

    setMessage(
        "Вход выполнен"
    );

        } else {

            setMessage(
                result.error || "Ошибка входа"
            );

        }

    }



    return (

        <div className="container">


            <h1>
                TestMaster
            </h1>


            <h2>
                Вход
            </h2>


            <form
                className="register-form"
                onSubmit={submit}
            >


                <input

                    name="email"

                    placeholder="Email"

                    type="email"

                    onChange={change}

                />


                <input

                    name="password"

                    placeholder="Пароль"

                    type="password"

                    onChange={change}

                />


                <button>

                    Войти

                </button>


            </form>


            {
                message &&
                <p>
                    {message}
                </p>
            }


        </div>

    );

}


export default Login;