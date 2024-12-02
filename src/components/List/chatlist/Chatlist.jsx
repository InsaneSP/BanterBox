import { useState, useEffect } from "react";
import './chatlist.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import acclogo from "../images/acclogo.png";
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";
import { doc, getDoc,onSnapshot, updateDoc } from "firebase/firestore";
import { db } from '../../../lib/firebase';
import AddUser from './adduser/Adduser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

const Chatlist = () => {
    const [chats, setChats] = useState([]);
    const [addMode, setAddMode] = useState(false);
    const [input, setInput] = useState("");

    const { currentUser } = useUserStore();
    const { chatId, changeChat } = useChatStore();

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "userchats", currentUser.id), 
        async (res) => {
            const items = res.data().chats;

            const promises = items.map(async(item)=>{
                const userdocRef = doc(db, "users", item.receiverId);
                const userDocSnap = await getDoc(userdocRef);
                const user = userDocSnap.data();
                return {...item, user};
            });
            
            const chatData = await Promise.all(promises)
            
            setChats(chatData.sort((a,b)=>b.updatedAt - a.updatedAt))
        }
    );

        return () => {
            unSub();
        };
    }, [currentUser.id]);

    const handleSelect = async (chat) =>{
        const userChats = chats.map(item=>{
            const { user, ...rest } = item;
            return rest;
        });

        const chatIndex = userChats.findIndex(
            (item) => item.chatId === chat.chatId
        );
        
        userChats[chatIndex].isSeen = true;

        const userChatsRef = doc(db, "userchats", currentUser.id);

        try {
            await updateDoc(userChatsRef, {
                chats: userChats,
            });
            changeChat(chat.chatId, chat.user);
        } catch (error) { }
    }

    const filteredChats = chats.filter((c) => {
        return c.user && c.user.username.toLowerCase().includes(input.toLowerCase());
    });

    return (
        <div className="Chatlist">
            <div className="search">
                <div className="searchBar">
                <FontAwesomeIcon className="icons" icon={faSearch} />
                    <input type="text" placeholder="Search" onChange={(e) => setInput(e.target.value)}/>
                </div>
                <div onClick={() => setAddMode((prev) => !prev)}>
                    {addMode ? <FontAwesomeIcon className="icons" icon={faMinus} /> : <FontAwesomeIcon className="icons" icon={faPlus} />}
                </div>
            </div>
            {filteredChats.map((chat) => (
                <div className="item" key={chat.chatId} onClick={()=>handleSelect(chat)} style={{backgroundColor: chat?.isSeen ? "transparent" : "#FF4747"}}>
                    <img src={chat.user.blocked.includes(currentUser.id) ? acclogo : chat.user.avatar || acclogo} alt="" />
                    <div className="texts">
                        <span>{chat.user.blocked.includes(currentUser.id) ? "User" : chat.user.username}</span>
                        <p>{chat.lastMessage}</p>
                    </div>
                </div>
            ))}
            {addMode && <AddUser />}
        </div>
    );
};

export default Chatlist;
