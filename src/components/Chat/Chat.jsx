import "./chat.css";
import acclogo from "../List/images/acclogo.png";
import emojilogo from "./emojilogo.png";
import EmojiPicker from "emoji-picker-react";
import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import {
    arrayRemove,
    arrayUnion,
    doc,
    getDoc,
    onSnapshot,
    updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { toast } from "react-toastify";
import upload from "../../lib/uploads";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { format } from "timeago.js";

const Chat = () => {
    const [chat, setChat] = useState({ messages: [] });
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [img, setImg] = useState({
        file: null,
        url: "",
    });

    const { currentUser } = useUserStore();
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();

    const endRef = useRef(null);

    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chat.messages]);

    useEffect(() => {
        if (!currentUser || !user) return;
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data());
        });

        const fetchUserBlockState = async () => {
            const userDocRef = doc(db, "users", currentUser.id);
            const userDoc = await getDoc(userDocRef);
            const blockedUsers = userDoc.data()?.blocked || [];

            // Check if the current user is blocking the receiver
            if (blockedUsers.includes(user.id)) {
                changeBlock(true);
            } 
        };

        fetchUserBlockState();
        return () => {
            unSub();
        };
    }, [chatId, currentUser, user, changeBlock]);

    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji);
        setOpen(false);
    };

    const handleImg = (event) => {
        if (event.target.files[0]) {
            setImg({
                file: event.target.files[0],
                url: URL.createObjectURL(event.target.files[0]),
            });
        }
    };

    const handleSend = async () => {
        if (text === "") return;

        let imgUrl = null;

        try {
            if (img.file) {
                imgUrl = await upload(img.file);
            }

            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                    ...(imgUrl && { img: imgUrl }),
                }),
            });

            const userIDs = [currentUser.id, user.id];
            userIDs.forEach(async (id) => {
                const userChatsRef = doc(db, "userchats", id);
                const userChatsSnapshot = await getDoc(userChatsRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();
                    const chatIndex = userChatsData.chats.findIndex(
                        (c) => c.chatId === chatId
                    );
                    userChatsData.chats[chatIndex].lastMessage = text;
                    userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
                    userChatsData.chats[chatIndex].updatedAt = Date.now();
                    await updateDoc(userChatsRef, {
                        chats: userChatsData.chats,
                    });
                }
            });
        } catch (error) {
            toast.warn(error.message);
        } finally {
            setImg({
                file: null,
                url: "",
            });
            setText("");
        }
    };

    const handleBlock = async () => {
        if (!user || !currentUser) return;
        const userDocRef = doc(db, "users", currentUser.id);
        try {
            await updateDoc(userDocRef, {
                blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
            });
            changeBlock();
        } catch (error) {
            toast.warn(error.message);
        }
    };

    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || acclogo} alt="" />
                    <div className="texts">
                        <span>{user?.username}</span>
                        <p>Let's chat</p>
                    </div>
                </div>
                <div className="icons">
                    <button className="block-button" onClick={handleBlock}>
                        {isCurrentUserBlocked
                            ? "You are blocked"
                            : isReceiverBlocked
                                ? "User Blocked"
                                : "Block User"}
                    </button>
                </div>
            </div>

            <div className="center">
                {chat?.messages?.map((message) => {
                    return (
                        <div
                            className={message.senderId === currentUser?.id ? "message own" : "message"}
                            key={message.createdAt}
                        >
                            <div className="texts">
                                {message.img && <img src={message.img} alt="" />}
                                <p>{message.text}</p>
                                <span>{format(message.createdAt.toDate())}</span>
                            </div>
                        </div>
                    );
                })}
                {img.url && (
                    <div className="message own">
                        <div className="texts">
                            <img src={img.url} alt="" />
                        </div>
                    </div>
                )}
                <div ref={endRef}></div>
            </div>

            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">
                        <FontAwesomeIcon icon={faImage} />
                    </label>
                    <input
                        type="file"
                        id="file"
                        style={{ display: "none" }}
                        onChange={handleImg}
                        disabled={isCurrentUserBlocked || isReceiverBlocked}
                    />
                </div>
                <input
                    className="inpt"
                    type="text"
                    placeholder={
                        isCurrentUserBlocked || isReceiverBlocked
                            ? "You cannot send a message"
                            : "Type a message ...."
                    }
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isCurrentUserBlocked || isReceiverBlocked}
                />
                <div className="emoji">
                    <img
                        src={emojilogo}
                        onClick={() => setOpen((prev) => !prev)}
                        style={{
                            cursor: isCurrentUserBlocked || isReceiverBlocked ? "not-allowed" : "pointer",
                        }}
                    />
                    {open &&
                        !isCurrentUserBlocked &&
                        !isReceiverBlocked && (
                            <div className="picker">
                                <EmojiPicker onEmojiClick={handleEmoji} />
                            </div>
                        )}
                </div>
                <button
                    className="sendButton"
                    onClick={handleSend}
                    disabled={isCurrentUserBlocked || isReceiverBlocked}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;