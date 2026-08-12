import { useEffect, useState } from "react";

import {
    getServices,
    registerUser
} from "../api/client";


function Register() {

    const [services, setServices] = useState([]);

    const [message, setMessage] = useState("");

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        service_id: ""
    });


    useEffect(() => {

        getServices()
            .then(setServices)
            .catch(() => {
                setMessage(
                    "Ошибка загрузки служб"
                );
            });

    }, []);



    function change(e) {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    }



    async function submit(e) {

        e.preventDefault();

        const result = await registerUser({
            ...form,
            service_id: Number(form.service_id)
        });


        if (result.id) {

            setMessage(
                "Регистрация успешна"
            );

        } else {

            setMessage(
                "Ошибка регистрации"
            );

        }

    }



    return (

        <div className="container">

            <h1>
                TestMaster
            </h1>


            <h2>
                Регистрация
            </h2>


            <form
                className="register-form"
                onSubmit={submit}
            >

                <input
                    name="name"
                    placeholder="Имя"
                    onChange={change}
                />


                <input
                    name="email"
                    placeholder="Email"
                    onChange={change}
                />


                <input
                    name="password"
                    type="password"
                    placeholder="Пароль"
                    onChange={change}
                />


                <select
                    name="service_id"
                    onChange={change}
                >

                    <option value="">
                        Выберите службу
                    </option>


                    {services.map(service => (

                        <option
                            key={service.id}
                            value={service.id}
                        >
                            {service.name}
                        </option>

                    ))}

                </select>


                <button>
                    Создать аккаунт
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


export default Register;