const login = async (usernameOrEmail, password) => {
 try {
   const res = await fetch("http://localhost:8080/api/auth/login", {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     body: JSON.stringify({
       usernameOrEmail,
       password,
     }),
     credentials: "include",
   })
   return res.json()
 } catch (error) {
  console.log(error);

 }

}

const logout = async () => {
  try {
    const res = await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }


}

const register = async (name, username, email, password) => {
  try {
    const res = await fetch("http://localhost:8080/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials:"include",
      body: JSON.stringify({
        name,
        username,
        email,
        password,
      }),
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }
}

const verifyEmail = async (otp,emailId) => {
  try {
    const res = await fetch(`http://localhost:8080/api/auth/verify/${emailId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials:"include",
      body: JSON.stringify({
        otp,
      }),
    })    
    return res.json()
  } catch (error) {
    console.log(error);

  }

}

const verifyOtpPassword = async (otp,emailId,newPassword,confirmPassword) => {
  try {
    const res = await fetch(`http://localhost:8080/api/auth/verifyotppwd/${emailId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials:"include",
      body: JSON.stringify({
        otp,
        newPassword,
        confirmPassword
      }),
    })    
    return res.json()
  } catch (error) {
    console.log(error);

  }

}

const resendOtp = async () => {
 try {
   const res = await fetch(`http://localhost:8080/api/auth/sendotp`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     credentials:"include"
   })
   return res.json()
 } catch (error) {
  console.log(error?.message);

 }

}

const sendOtpForfgtPwd = async (emailId) => {
 try {
   const res = await fetch(`http://localhost:8080/api/auth/sendOtpFgPwd`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     credentials:"include",
     body:JSON.stringify({
      emailId
     })
   })
   return res.json()
 } catch (error) {
  console.log(error?.message);
 }
}

const getUserDetails = async () => {
 try {
   const res = await fetch("http://localhost:8080/api/auth/getuserdetail", {
     method: "GET",
     headers: {
       "Content-Type": "application/json",
       Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
     },
     credentials: "include",
   })
 
   return res.json()
 } catch (error) {
  return error
 }
} 

const getAllUser = async () => {
  try {
    const res = await fetch("http://localhost:8080/api/auth/allUser", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }

}

const changePassword = async (usernameOrEmail,password,newPassword) => {
  try {
    const res = await fetch("http://localhost:8080/api/auth/changePassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body:JSON.stringify({
        usernameOrEmail,
        password,
        newPassword
        
      }),
      credentials: "include",
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }

}

const changeUserDetails = async (name,username,email) => {
  try {
    const res = await fetch("http://localhost:8080/api/auth/changeUserDetails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body:JSON.stringify({
        name,
        username,
        email
        
      }),
      credentials: "include",
    })
    return res.json()
  } catch (error) {
    console.log(error.message);

  }

}

const uploadAvatar = async (avatar) => {
  try {
    const formData = new FormData();
    formData.append("avatar", avatar);

    const res = await fetch("http://localhost:8080/api/auth/uploadAvatar", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    return await res.json();
  } catch (error) {
    console.error("Upload error:", error.message);
    return { success: false, message: error.message };
  }
};



export {
  login,
  logout,
  register,
  verifyEmail,
  resendOtp,
  getUserDetails,
  getAllUser,
  changePassword,
  changeUserDetails,
  uploadAvatar,
  sendOtpForfgtPwd,
  verifyOtpPassword
}