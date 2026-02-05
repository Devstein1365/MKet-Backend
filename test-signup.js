// Simple test script for signup endpoint
import fetch from "node-fetch";

const testSignup = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "John Doe Smith",
        email: "john.smith@st.futminna.edu.ng",
        password: "Test@1234",
        phone: "08012345678",
        studentId: "2021/1/12345MT",
      }),
    });

    const data = await response.json();

    console.log("\n========================================");
    console.log("📝 SIGNUP TEST RESULT");
    console.log("========================================");
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
    console.log("========================================\n");

    if (data.success && data.token) {
      console.log("✅ Signup successful!");
      console.log("🔑 JWT Token:", data.token.substring(0, 50) + "...");
      console.log("👤 User ID:", data.user.id);
      console.log("📧 Email:", data.user.email);
      console.log("🎨 Avatar Color:", data.user.avatarColor);
    } else {
      console.log("❌ Signup failed:", data.message);
    }
  } catch (error) {
    console.error("❌ Error testing signup:", error.message);
  }
};

testSignup();
