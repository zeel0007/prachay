import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Button } from '../../components/UI/Button';
import { Mail, Lock, User as UserIcon, Building, BadgeCheck } from 'lucide-react';
import { DEPARTMENTS } from '../../utils/constants';

export const RegisterPage = () => {
  const { register: registerAuth } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      department: 'Equity Research',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await registerAuth(data);
      addToast(`Account created! Welcome, ${res.user.name}.`, 'success');
      navigate('/employee/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Create Employee Account</h3>
        <p className="text-xs text-slate-500 mt-1">
          Register to submit and track your expense reimbursement vouchers.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name *"
          placeholder="e.g. Ramesh Kumar"
          icon={UserIcon}
          {...register('name', { required: 'Name is required' })}
          error={errors.name?.message}
        />

        <Input
          label="Work Email *"
          type="email"
          placeholder="ramesh@prachay.com"
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
          label="Employee ID (Optional)"
          placeholder="e.g. EMP-204"
          icon={BadgeCheck}
          {...register('employeeId')}
        />

        <Select
          label="Department *"
          options={DEPARTMENTS}
          {...register('department', { required: 'Department is required' })}
          error={errors.department?.message}
        />

        <Input
          label="Password *"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          })}
          error={errors.password?.message}
        />

        <Button type="submit" isLoading={isLoading} className="w-full mt-2" size="lg">
          Register Employee Account
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-blue-600 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};
