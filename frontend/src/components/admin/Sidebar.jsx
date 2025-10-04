import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUsersCog, FaUserShield, FaCheckCircle, FaUserPlus, FaSignOutAlt, FaSitemap } from 'react-icons/fa';
import styles from './AdminDashboard.module.css';
import { getAdmin } from './utils/adminAuth';

const iconProps = { color: '#fff', size: 18, style: { minWidth: 18 } };

const options = {
  super_admin: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FaTachometerAlt {...iconProps} /> },
    { name: 'Manage Nodes', path: '/admin/nodes', icon: <FaSitemap {...iconProps} /> },
    { name: 'Manage Admins', path: '/admin/admins', icon: <FaUsersCog {...iconProps} /> },
    { name: 'Approve Cases', path: '/admin/cases', icon: <FaCheckCircle {...iconProps} /> },
    { name: 'Register Admin', path: '/admin/register', icon: <FaUserPlus {...iconProps} /> },
  ],
  node_admin: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FaTachometerAlt {...iconProps} /> },
    { name: 'Manage Supervisors', path: '/admin/supervisors', icon: <FaUserShield {...iconProps} /> },
    { name: 'Approve Node Cases', path: '/admin/cases', icon: <FaCheckCircle {...iconProps} /> },
  ],
  supervisor: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FaTachometerAlt {...iconProps} /> },
    { name: 'Approve Cases', path: '/admin/cases', icon: <FaCheckCircle {...iconProps} /> },
    { name: 'View Users', path: '/admin/users', icon: <FaUsersCog {...iconProps} /> },
  ]
};

export default function Sidebar({ role }) {
  const admin = getAdmin();
  return (
    <aside className={styles.adminSidebar}>
      <div className={styles.adminSidebarTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <FaUserShield color="#fff" size={28} style={{ marginRight: 6 }} />
        Admin Panel
      </div>
      <nav className={styles.adminSidebarNav}>
        <ul>
          {options[role]?.map(opt => (
            <li key={opt.path}>
              <NavLink
                to={opt.path}
                className={({ isActive }) =>
                  isActive ? `${styles.activeLink}` : undefined
                }
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                {opt.icon} {opt.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div style={{ flex: 1 }} />
      <div style={{ marginTop: 'auto', width: '100%', paddingTop: 24, borderTop: '1px solid #334155', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ color: '#cbd5e1', fontWeight: 500, marginBottom: 8, fontSize: 15 }}>
          <FaUserShield color="#fff" style={{ marginRight: 6, verticalAlign: 'middle' }} />
          {admin?.name} <span style={{ fontSize: 13, color: '#94a3b8' }}>({admin?.role?.replace('_', ' ')})</span>
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem('admin');
            sessionStorage.removeItem('adminToken');
            window.location.href = '/admin/login';
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#f87171',
            fontWeight: 600,
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            marginTop: 6
          }}
        >
          <FaSignOutAlt color="#fff" /> Logout
        </button>
      </div>
    </aside>
  );
} 