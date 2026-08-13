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

            <div className="form-eyebrow">Новый аккаунт</div>
            <h2>Регистрация</h2>
            <p className="form-subtitle">Заполните данные и выберите службу</p>


            <form
                className="register-form"
                onSubmit={submit}
            >

                <label className="field-label">Имя</label>
                <input
                    name="name"
                    placeholder="Имя"
                    onChange={change}
                />


                <label className="field-label">Email</label>
                <input
                    name="email"
                    placeholder="Email"
                    onChange={change}
                />


                <label className="field-label">Пароль</label>
                <input
                    name="password"
                    type="password"
                    placeholder="Пароль"
                    onChange={change}
                />


                <label className="field-label">Служба</label>
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


                <button className="btn-primary btn-block">
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