import styled from 'styled-components';
import { berryTheme } from '../../Theme';
import NavBar from '../../Component/Nweb/NavBar'; // Make sure this path is correct

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  background: ${berryTheme.colors.backgroundGradient};
  position: relative;
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${berryTheme.spacing.medium};
  padding-bottom: 80px; /* Space for footer */
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
`;

const MainLayout = ({ children }) => {
  return (
    <LayoutContainer>
      <MainContent>
        {children}
      </MainContent>
      <NavBar />
    </LayoutContainer>
  );
};

export default MainLayout;