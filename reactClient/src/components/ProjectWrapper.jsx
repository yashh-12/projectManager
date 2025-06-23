import { useParams } from 'react-router-dom';
import { SocketProvider } from './provider/SocketProvider';

const ProjectWrapper = ({ children }) => {
  const { projectId } = useParams(); 

  return (
    <SocketProvider projectId={projectId}>
      {children}
    </SocketProvider>
  );
};

export default ProjectWrapper
