import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';
import { Mail, Lock, LogIn } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await login(data);
      addToast(`Welcome back, ${res.user.name}!`, 'success');

      if (res.user.role === 'Director') {
        navigate('/director/dashboard');
      } else if (res.user.role === 'Accounts') {
        navigate('/accounts/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickDemo = (email, password) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-[#141413] tracking-tight">Sign In to Your Account</h3>
        <p className="text-xs text-stone-500 mt-1">Enter credentials to manage expense vouchers.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address *"
          type="email"
          placeholder="name@prachay.com"
          icon={Mail}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
              message: 'Invalid email address',
            },
          })}
          error={errors.email?.message}
        />

        <Input
          label="Password *"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          {...register('password', { required: 'Password is required' })}
          error={errors.password?.message}
        />

        <Button type="submit" isLoading={isLoading} icon={LogIn} className="w-full mt-2" size="lg">
          Sign In
        </Button>
      </form>

      {/* Quick Demo Credentials */}
      <div className="pt-4 border-t border-[#EDE9E5]">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CF4500]" />
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Demo Quick Access
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillQuickDemo('rahul.mehta@prachay.com', 'Employee@123')}
            className="p-2.5 text-[11px] bg-stone-100 hover:bg-[#141413] hover:text-white border border-[#D5D1CC] rounded-full text-[#141413] font-medium transition-all"
          >
            Employee
          </button>
          <button
            type="button"
            onClick={() => fillQuickDemo('director@prachay.com', 'Director@123')}
            className="p-2.5 text-[11px] bg-amber-50 hover:bg-amber-900 hover:text-white text-amber-900 border border-amber-300 rounded-full font-medium transition-all"
          >
            Director
          </button>
          <button
            type="button"
            onClick={() => fillQuickDemo('accounts@prachay.com', 'Accounts@123')}
            className="p-2.5 text-[11px] bg-stone-200/70 hover:bg-stone-900 hover:text-white text-stone-900 border border-stone-300 rounded-full font-medium transition-all"
          >
            Accounts
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-stone-500 pt-2 border-t border-[#EDE9E5]">
        Need an Employee account?{' '}
        <Link to="/register" className="font-semibold text-[#141413] hover:underline">
          Register Employee
        </Link>
      </div>
    </div>
  );
};
