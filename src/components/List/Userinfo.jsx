import "./userinfo.css";
import acclogo from "./images/acclogo.png";
import { useUserStore } from "../../lib/userStore";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import Logout from "../Logout/Logout.jsx";

const Userinfo = () => {
    const [addMode, setAddMode] = useState(false);

    const { currentUser } = useUserStore();
    return (
        <div className="userinfo">
            <div className="user">
                <img src={currentUser.avatar || acclogo} alt="" />
                <h2>{currentUser.username}</h2>
            </div>
            <div className="icons">
                <div onClick={() => setAddMode((prev) => !prev)}>
                    <FontAwesomeIcon className="icons" icon={faRightFromBracket} />
                </div>
            </div>
            {addMode && <Logout />}
        </div>
    );
};

export default Userinfo;
