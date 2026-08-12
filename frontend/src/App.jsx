import { useState } from "react";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";


function App() {


    const [page, setPage] = useState(
        localStorage.getItem("token")
            ? "home"
            : "login"
    );



    function logout() {

        localStorage.removeItem("token");

        setPage("login");

    }



    return (

        <>

            {
                page === "home"

                ?

                <>

                    <Home />


                    <div style={{
                        textAlign: "center",
                        marginTop: "20px"
                    }}>

                        <button onClick={logout}>
                            Выйти
                        </button>

                    </div>

                </>


                :

                page === "login"

                ?

                <>

                    <Login />


                    <div style={{
                        textAlign: "center",
                        marginTop: "20px"
                    }}>

                        <button
                            onClick={() => setPage("register")}
                        >
                            Регистрация
                        </button>

                    </div>

                </>


                :

                <>

                    <Register />


                    <div style={{
                        textAlign: "center",
                        marginTop: "20px"
                    }}>

                        <button
                            onClick={() => setPage("login")}
                        >
                            Войти
                        </button>

                    </div>

                </>

            }


        </>

    );

}


export default App;