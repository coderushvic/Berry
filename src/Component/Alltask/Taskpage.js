import React, { useState } from "react";
import YoutubeTasks from "./YoutubeTasks";
import ManualTasks from "./ManualTasks";
import { useUser } from "../../context/userContext";
import { BsCheck2Circle } from "react-icons/bs";
import { FiArrowRight } from "react-icons/fi";
import Footer from "../Footer/Footer";

const TaskPage = () => {
  const [isPersonalTasks, setIsPersonalTasks] = useState(true);
  const { completedDailyTasks, dailyTasks, youtubeTasks } = useUser();

  const toggleTaskList = () => {
    setIsPersonalTasks((prev) => !prev);
  };

  const personalTasks = youtubeTasks.filter(task => task.type === "personal"); 
  const sponsoredTasks = dailyTasks.filter(task => task.type === "sponsored");

  const personalTaskCount = personalTasks.length;
  const sponsoredTaskCount = sponsoredTasks.length;

  const handleTaskClick = (task) => {
    if (task.link) {
      // Remove any democats.netlify.app prefix if present
      const cleanedLink = task.link.replace(/^(https?:\/\/)?([^/]+\.)?democats\.netlify\.app\//i, '');
      window.open(cleanedLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.scrollContainer}>
        <div style={styles.content}>
          <header style={styles.header}>
            <h1 style={styles.title}>Daily Tasks</h1>
            <p style={styles.subtitle}>Complete tasks to earn NEWCATS tokens</p>
          </header>

          <div style={styles.toggleContainer}>
            <button
              style={{
                ...styles.toggleButton,
                ...(isPersonalTasks && styles.activeToggleButton)
              }}
              onClick={toggleTaskList}
            >
              <span>Personal Tasks</span>
              {personalTaskCount > 0 && (
                <span style={styles.taskCountBadge}>{personalTaskCount}</span>
              )}
            </button>
            <button
              style={{
                ...styles.toggleButton,
                ...(!isPersonalTasks && styles.activeToggleButton)
              }}
              onClick={toggleTaskList}
            >
              <span>Sponsored Tasks</span>
              {sponsoredTaskCount > 0 && (
                <span style={styles.taskCountBadge}>{sponsoredTaskCount}</span>
              )}
            </button>
          </div>

          <div style={styles.taskListContainer}>
            {isPersonalTasks ? (
              <YoutubeTasks />
            ) : (
              <ManualTasks />
            )}
          </div>

          <section style={styles.completedSection}>
            <h2 style={styles.sectionTitle}>
              <span>All Available Tasks</span>
              <span style={styles.sectionTitleDecoration}></span>
            </h2>
            
            <div style={styles.taskCardsContainer}>
              {dailyTasks.map((task) => {
                const isCompleted = completedDailyTasks.includes(task.id);
                return (
                  <div
                    key={task.id}
                    style={{
                      ...styles.taskCard,
                      ...(isCompleted && styles.completedTaskCard),
                      borderLeftColor: isCompleted ? '#2ecc71' : '#3498db'
                    }}
                    onClick={() => !isCompleted && handleTaskClick(task)}
                  >
                    <div style={styles.taskInfo}>
                      <h3 style={styles.taskTitle}>{task.title}</h3>
                      <p style={styles.taskDescription}>{task.description || "Complete this task to earn rewards"}</p>
                    </div>
                    <div style={styles.taskReward}>
                      <span style={styles.rewardAmount}>+{task.bonus} NEWCATS</span>
                      {isCompleted ? (
                        <div style={styles.completedStatus}>
                          <BsCheck2Circle style={styles.checkIcon} />
                          <span>Completed</span>
                        </div>
                      ) : (
                        <div style={styles.pendingStatus}>
                          <FiArrowRight style={styles.arrowIcon} />
                          <span>Start Task</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: "'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif",
    color: '#333',
    backgroundColor: '#f8f9fa',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  scrollContainer: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '80px' // Add padding to prevent footer from covering content
  },
  content: {
    animation: 'fadeIn 0.3s ease-out'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '8px'
  },
  subtitle: {
    color: '#7f8c8d',
    fontSize: '0.95rem'
  },
  toggleContainer: {
    display: 'flex',
    backgroundColor: '#ecf0f1',
    borderRadius: '12px',
    padding: '5px',
    marginBottom: '25px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
  },
  toggleButton: {
    flex: 1,
    padding: '12px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    fontWeight: '600',
    color: '#7f8c8d',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    position: 'relative'
  },
  activeToggleButton: {
    backgroundColor: 'white',
    color: '#3498db',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  taskCountBadge: {
    backgroundColor: '#e74c3c',
    color: 'white',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem'
  },
  taskListContainer: {
    marginBottom: '30px',
    animation: 'fadeIn 0.4s ease-out'
  },
  completedSection: {
    marginTop: '20px'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    fontSize: '1.2rem',
    color: '#2c3e50',
    position: 'relative'
  },
  sectionTitleDecoration: {
    flex: 1,
    height: '1px',
    backgroundColor: '#ecf0f1',
    marginLeft: '15px'
  },
  taskCardsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    borderLeft: '4px solid #3498db',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
    }
  },
  completedTaskCard: {
    backgroundColor: '#f8fff9'
  },
  taskInfo: {
    flex: 1
  },
  taskTitle: {
    fontWeight: '600',
    marginBottom: '5px',
    color: '#2c3e50'
  },
  taskDescription: {
    fontSize: '0.85rem',
    color: '#7f8c8d',
    marginBottom: '0'
  },
  taskReward: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginLeft: '15px'
  },
  rewardAmount: {
    fontWeight: '700',
    color: '#f39c12',
    marginBottom: '8px'
  },
  completedStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.85rem',
    padding: '5px 10px',
    borderRadius: '20px',
    backgroundColor: '#e8f8ee',
    color: '#27ae60'
  },
  pendingStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.85rem',
    padding: '5px 10px',
    borderRadius: '20px',
    backgroundColor: '#f0f7fd',
    color: '#3498db',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#e1f0fa'
    }
  },
  checkIcon: {
    color: '#2ecc71'
  },
  arrowIcon: {
    color: '#3498db'
  },
  '@media (max-width: 480px)': {
    taskCard: {
      flexDirection: 'column',
      alignItems: 'flex-start'
    },
    taskReward: {
      alignItems: 'flex-start',
      marginLeft: '0',
      marginTop: '10px',
      width: '100%'
    },
    pendingStatus: {
      alignSelf: 'flex-end'
    },
    completedStatus: {
      alignSelf: 'flex-end'
    }
  }
};

export default TaskPage;
