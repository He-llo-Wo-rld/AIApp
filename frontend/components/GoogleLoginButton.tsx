import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import axios from "../lib/axios";

const GoogleLoginButton = () => {
  const router = useRouter();
  const handleSuccess: (credentialResponse: any) => Promise<void> = async (
    credentialResponse: any
  ) => {
    const token = credentialResponse.credential;
    try {
      const res = await axios.post("/google-login/", { token });
      alert(res.data.detail);
      router.push("/"); // Redirect to home page
    } catch (err: any) {
      alert(err.response?.data?.detail || "Google login error");
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => alert("Google login failed")}
    />
  );
};

export default GoogleLoginButton;
