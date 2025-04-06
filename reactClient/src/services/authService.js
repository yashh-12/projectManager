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
      body: JSON.stringify({
        otp,
      }),
    })
    return res.json()
  } catch (error) {
    console.log(error);

  }

}

const resendOtp = async (emailId) => {
 try {
   const res = await fetch(`http://localhost:8080/api/auth/sendotp`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
   })
   return res.json()
 } catch (error) {
  console.log(error);

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
  console.log(error);

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

export {
  login,
  logout,
  register,
  verifyEmail,
  resendOtp,
  getUserDetails,
  getAllUser,
}