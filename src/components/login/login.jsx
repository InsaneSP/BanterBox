import React, { Component } from "react";
import { toast } from "react-toastify";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import upload from "../../lib/uploads";
import "./login.css";
import logo from "../../BanterBox.png";

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSignIn: false,
            username: "",
            email: "",
            password: "",
            image: null,
            imagePreviewUrl: "",
            loading: false,
            isForgot: false,
            resetEmail: "",
            resetMessage: "",
            resetError: "",
        };
    }

    toggleSignIn = () => {
        this.setState({
            isSignIn: true,
            email: "",
            password: "",
        });
    };

    toggleSignUp = () => {
        this.setState({
            isSignIn: false,
            username: "",
            email: "",
            password: "",
            image: null,
            imagePreviewUrl: "",
        });
    };

    handleSignIn = async (event) => {
        event.preventDefault();
        const { email, password } = this.state;
        this.setState({ loading: true });

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            toast.error("Invalid Email or Password");
        } finally {
            this.setState({ loading: false });
        }
    };

    handleSignUp = async (event) => {
        event.preventDefault();
        this.setState({ loading: true });
        const { username, email, password, image } = this.state;

        if (!this.validatePassword(password)) return;
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const imagePreviewUrl = image ? await upload(image) : "";

            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar: imagePreviewUrl,
                id: res.user.uid,
                blocked: [],
            });

            await setDoc(doc(db, "userchats", res.user.uid), { chats: [] });
            toast.success("Account Created! You can Sign In Now");
        } catch (error) {
            toast.error(error.message);
        } finally {
            this.setState({ loading: false });
        }
    };

    handleAvatar = (event) => {
        if (event.target.files[0]) {
            this.setState({
                image: event.target.files[0],
                imagePreviewUrl: URL.createObjectURL(event.target.files[0]),
            });
        }
    };

    handleChange = (event) => {
        const { name, value, type, files } = event.target;
        if (type === "file") {
            const file = files[0];
            this.setState({
                image: file,
                imagePreviewUrl: URL.createObjectURL(file),
            });
        } else {
            this.setState({ [name]: value });
        }
    };

    validatePassword(password) {
        const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!regex.test(password)) {
            toast.error(
                "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
            );
            this.setState({ loading: false });
            return false;
        }
        return true;
    }

    handlePasswordReset = async (event) => {
        event.preventDefault();
        this.setState({ resetMessage: "", resetError: "" });
        const { resetEmail } = this.state;
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            this.setState({
                resetMessage: "Check your email for a password reset link!",
            });
        } catch (error) {
            this.setState({ resetError: error.message });
        }
    };

    handleBack = () => {
        this.setState({
            isForgot: false,
            resetMessage: "",
            resetError: "",
        });
    };

    render() {
        const { isSignIn, username, email, password, image, loading, isForgot } = this.state;
        
        return (
            <div className="fullscreen">
                {/* <img src={logo} /> */}
                <div className={`card text-center`}>
                    <div className="card-content">
                        {this.state.resetMessage && (
                            <p className="success">
                                We sent it! Go check your inbox (or your nearest bar)!
                            </p>
                        )}
                        {this.state.resetError && (
                            <p style={{ color: "red" }}>
                                Uh-oh! Something went wrong. Maybe the bad guys are at it again?
                            </p>
                        )}
                        {isForgot ? (
                            <div className="password-reset">
                                <div className="btn-back" onClick={this.handleBack}>
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                </div>
                                <h2>Time to Regenerate: Reset Your Password, Hero!</h2>
                                <form className="passform" onSubmit={this.handlePasswordReset}>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={this.state.resetEmail}
                                        onChange={(e) =>
                                            this.setState({ resetEmail: e.target.value })
                                        }
                                        required
                                    />
                                    <button type="submit" disabled={loading}>
                                        {loading ? "Sending..." : "Send Reset Link"}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div
                                className={`container ${!isSignIn ? "right-panel-active" : ""}`}
                                id="container"
                            >
                                <div className={`form-container sign-in-container`}>
                                    <form onSubmit={this.handleSignIn}>
                                        <h1 className="login-heading">Sign In</h1>
                                        <span className="subheading">With Email and Password</span>
                                        <input
                                            className="input"
                                            type="email"
                                            placeholder="Email"
                                            name="email"
                                            value={email}
                                            onChange={this.handleChange}
                                            required
                                        />
                                        <input
                                            className="input"
                                            type="password"
                                            placeholder="Password"
                                            name="password"
                                            value={password}
                                            onChange={this.handleChange}
                                            required
                                        />
                                        <button
                                            className="login-button"
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? "Loading" : "Sign In"}
                                        </button>
                                        <a
                                            href="#"
                                            onClick={() => this.setState({ isForgot: true })}
                                        >
                                            Forgot your password?
                                        </a>
                                    </form>
                                </div>

                                <div className={`form-container sign-up-container`}>
                                    <form onSubmit={this.handleSignUp}>
                                        <h1 className="login-heading">Sign Up</h1>
                                        <span className="subheading">With Email and Password</span>
                                        <div>
                                            {image && (
                                                <div className="image-preview">
                                                    <img src={URL.createObjectURL(image)} alt="Preview" />
                                                </div>
                                            )}
                                            <label className="custom-file-upload">
                                                <input
                                                    type="file"
                                                    className="photo"
                                                    name="image"
                                                    onChange={this.handleAvatar}
                                                    accept="image/*"
                                                />{" "}
                                                Choose File
                                            </label>
                                        </div>
                                        <input
                                            className="input"
                                            type="text"
                                            placeholder="Name"
                                            name="username"
                                            value={username}
                                            onChange={this.handleChange}
                                            required
                                        />
                                        <input
                                            className="input"
                                            type="email"
                                            placeholder="Email"
                                            name="email"
                                            value={email}
                                            onChange={this.handleChange}
                                            required
                                        />
                                        <input
                                            className="input"
                                            type="password"
                                            placeholder="Password"
                                            name="password"
                                            value={password}
                                            onChange={this.handleChange}
                                            required
                                        />
                                        <button
                                            className="login-button"
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? "Loading" : "Sign Up"}
                                        </button>
                                    </form>
                                </div>

                                <div className="overlay-container">
                                    <div className="overlay">
                                        <div className="overlay-panel overlay-left">
                                            <h1>Back for More, Aren't You?</h1>
                                            <p className="subtext">
                                                Your next adventure awaits — Sign In!
                                            </p>
                                            <button
                                                className="login-button ghost"
                                                onClick={this.toggleSignIn}
                                            >
                                                Sign Up
                                            </button>
                                        </div>
                                        <div className="overlay-panel overlay-right">
                                            <h1>Bub, You're in Good Company!</h1>
                                            <p className="subtext">
                                                Join a community where every chat is a battle!
                                            </p>
                                            <button
                                                className="login-button ghost"
                                                onClick={this.toggleSignUp}
                                            >
                                                Sign In
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default LoginPage;
