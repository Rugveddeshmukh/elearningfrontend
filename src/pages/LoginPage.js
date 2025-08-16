// import React, { useState } from 'react';
// import api from '../utils/api'; // ✅ use this instead of axios directly
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';

// const LoginPage = () => {
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [sent, setSent] = useState(false);
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSendOtp = async () => {
//     try {
//       await api.post('/auth/send-otp', { email }); // ✅ use api not axios
//       setSent(true);
//     } catch (err) {
//       alert(err.response?.data?.message || 'Failed to send OTP');
//     }
//   };

//   const handleVerifyOtp = async () => {
//     try {
//       const res = await api.post('/auth/verify-otp', { email, code: otp }); // ✅
//       login(res.data.token);
//       navigate(res.data.user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
//     } catch (err) {
//       alert(err.response?.data?.message || 'OTP verification failed');
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
//       <h2 className="text-xl font-semibold mb-4">OTP Login</h2>
//       <input
//         type="email"
//         placeholder="Enter Email"
//         value={email}
//         onChange={e => setEmail(e.target.value)}
//         className="w-full mb-4 p-2 border rounded"
//       />
//       {sent && (
//         <input
//           type="text"
//           placeholder="Enter OTP"
//           value={otp}
//           onChange={e => setOtp(e.target.value)}
//           className="w-full mb-4 p-2 border rounded"
//         />
//       )}
//       {!sent ? (
//         <button onClick={handleSendOtp} className="bg-blue-500 text-white px-4 py-2 rounded">Send OTP</button>
//       ) : (
//         <button onClick={handleVerifyOtp} className="bg-green-500 text-white px-4 py-2 rounded">Verify OTP</button>
//       )}
//     </div>
//   );
// };

// export default LoginPage;

import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    dateOfBirth: '',
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const res = await api.post('/auth/login', {
          email: form.email,
          password: form.password,
        });

        login(res.data.token);
        navigate(res.data.user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
      } else {
        await api.post('/auth/register', form);
        alert('Signup successful! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">{isLogin ? 'Login' : 'Sign Up'}</h2>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <input
              name="fullName"
              placeholder="Full Name"
              onChange={handleChange}
              className="w-full mb-4 p-2 border rounded"
            />
            <input
              name="dateOfBirth"
              placeholder="Date of Birth (YYYY-MM-DD)"
              type="date"
              onChange={handleChange}
              className="w-full mb-4 p-2 border rounded"
            />
          </>
        )}

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>

      <p className="text-sm text-center mt-4">
        {isLogin ? 'New user?' : 'Already have an account?'}{' '}
        <span
          className="text-blue-600 cursor-pointer underline"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Create an account' : 'Login'}
        </span>
      </p>
    </div>
  );
};

export default AuthPage;

