import styled from 'styled-components';
import { berryTheme } from '../../Theme';
import NavBar from '../../Component/Nweb/NavBar';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background: ${berryTheme.colors.backgroundGradient};
  position: relative;
  overflow-x: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
  max-width: 100%;
  padding: 0;
  margin: 0;
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