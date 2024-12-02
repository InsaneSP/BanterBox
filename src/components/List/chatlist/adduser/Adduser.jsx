import "./adduser.css";
import acclogo from '../../images/acclogo.png';
import { arrayUnion, collection, doc, setDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../../../../lib/firebase"
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useUserStore } from "../../../../lib/userStore";
import { getDoc } from "firebase/firestore";

const AddUser = () => {
    const [user,setUser] = useState(null);
    const {currentUser} = useUserStore();

    const handleSearch = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const username = formData.get("username").toLowerCase();
    
        try {
            const userRef = collection(db, "users");
            const querySnapShot = await getDocs(userRef);
    
            const foundUser = querySnapShot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .find(user => user.username.toLowerCase() === username);
    
            if (foundUser) {
                setUser(foundUser);
            } else {
                toast.warn("User not found");
            }
        } catch (error) {
            toast.warn(error.message);
        }
    };
    
    const handleAdd = async () => {
        const userChatsRef = collection(db, "userchats");
        try {
            // Fetch the current user's chat document
            const currentUserChatDocRef = doc(userChatsRef, currentUser.id);
            const currentUserChatDoc = await getDoc(currentUserChatDocRef);
            const userChats = currentUserChatDoc.exists() ? currentUserChatDoc.data().chats : [];
    
            // Check if the user is already in the chats
            const isUserAlreadyAdded = userChats.some(chat => chat.receiverId === user.id);
    
            if (isUserAlreadyAdded) {
                toast.warn("User is already in your chat list.");
                return;
            }
    
            // Create a new chat
            const chatRef = collection(db, "chats");
            const newChatRef = doc(chatRef);
            
            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });
    
            await updateDoc(currentUserChatDocRef, {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: user.id,
                    updatedAt: Date.now(),
                }),
            });

            // Also update the other user's chat list
            await updateDoc(doc(userChatsRef, user.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updatedAt: Date.now(),
                }),
            });
            toast.success("User added successfully!");
        } catch (error) {
            toast.warn(error.message);
        }
    };
    
    return (
        <div className="adduser">
            <form onSubmit={handleSearch}>
                <input type="text" placeholder="Username" name="username" />
                <button>Search</button>
            </form>

            {user && <div className="user">
                <div className="detail">
                <img src={user.avatar || acclogo} alt="" />
                    <span>{user.username}</span>
                </div>
                <button onClick={handleAdd}>Add User</button>
            </div>}
        </div>
    );
};

export default AddUser;
