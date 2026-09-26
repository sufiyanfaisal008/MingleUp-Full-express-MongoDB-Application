import React from 'react';
import { Input } from 'antd';
import { LockOutlined } from '@ant-design/icons';

const PasswordInput = ({ placeholder, value, onChange }) => (
  <div className="relative w-full">
    <Input.Password
      size="large"
      placeholder={placeholder || "Enter password"}
      value={value}
      onChange={onChange}
      prefix={<LockOutlined className="password-lock-icon text-slate-400 text-base mr-2" />}
      className="custom-pass-input"
    />
    <style jsx="true">{`
      .custom-pass-input.ant-input-affix-wrapper {
        background-color: rgba(2, 6, 23, 0.6) !important;
        border-color: #1e293b !important;
        border-radius: 1rem !important;
        padding-top: 0.75rem !important;
        padding-bottom: 0.75rem !important;
        padding-left: 1rem !important;
        padding-right: 1rem !important;
        display: flex !important;
        align-items: center !important;
      }
      /* Lock Icon Force Show */
      .custom-pass-input .password-lock-icon {
        color: #94a3b8 !important;
        display: inline-flex !important;
        visibility: visible !important;
        opacity: 1 !important;
        margin-right: 10px !important;
      }
      .custom-pass-input.ant-input-affix-wrapper:hover,
      .custom-pass-input.ant-input-affix-wrapper:focus,
      .custom-pass-input.ant-input-affix-wrapper-focused {
        border-color: #6366f1 !important;
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15) !important;
      }
      .custom-pass-input input.ant-input {
        background-color: transparent !important;
        color: #f8fafc !important;
      }
      .custom-pass-input input.ant-input::placeholder {
        color: #64748b !important;
        opacity: 1 !important;
      }
      /* Password Show/Hide Eye Icon Styling */
      .custom-pass-input .ant-input-password-icon {
        color: #94a3b8 !important;
        transition: color 0.3s ease !important;
      }
      .custom-pass-input .ant-input-password-icon:hover {
        color: #6366f1 !important;
      }
    `}</style>
  </div>
);

export default PasswordInput;