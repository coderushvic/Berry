import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { berryTheme } from '../../Theme';
import { FaHome, FaUserFriends, FaCoins, FaUser } from 'react-icons/fa';

const FooterContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${berryTheme.colors.cardBackground};
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  z-index: 100;
  max-width: auto;
  margin: 0 auto;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

const NavLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: ${props => props.$active ? berryTheme.colors.primary : berryTheme.colors.textMuted};
  font-size: 0.8rem;
  font-weight: ${props => props.$active ? '600' : '500'};
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
  width: 25%;
  text-align: center;

  &:hover {
    color: ${berryTheme.colors.primary};
    background: ${berryTheme.colors.cardHighlight};
  }
`;

const NavIcon = styled.div`
  font-size: 1.4rem;
  margin-bottom: 6px;
  transition: transform 0.2s ease;
  
  ${NavLink}:hover & {
    transform: scale(1.1);
  }
`;

const NavBar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { 
      icon: <FaHome />, 
      label: 'Home', 
      path: '/',
      active: isActive('/') 
    },
     { 
      icon: <FaUserFriends />, 
      label: 'Referrals', 
      path: '/Referrals',
      active: isActive('/Referrals') 
    },
    { 
      icon: <FaCoins />, 
      label: 'Withdraw', 
      path: '/userdash',
      active: isActive('/userdash') 
    },
    { 
      icon: <FaUser />, 
      label: 'Profile', 
      path: '/ProfilePage',
      active: isActive('/ProfilePage') 
    }
  ];

  return (
    <FooterContainer>
      {navItems.map((item) => (
        <NavLink 
          key={item.path}
          to={item.path}
          $active={item.active}
        >
          <NavIcon>{item.icon}</NavIcon>
          {item.label}
        </NavLink>
      ))}
    </FooterContainer>
  );
};

export default NavBar;
