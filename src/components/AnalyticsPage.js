import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { firestore } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../styles/AnalyticsPage.css';  // Import CSS for styling

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = () => {
  const [projectData, setProjectData] = useState({
    labels: ['In Progress', 'Completed'],
    datasets: [
      {
        label: 'Projects',
        backgroundColor: ['rgb(0, 145, 255)', 'rgba(0, 255, 0, 1)'],
        borderColor: 'rgba(0,0,0,1)',
        borderWidth: 2,
        data: [0, 0],
      },
    ],
  });

  const [updateData, setUpdateData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Updates per Day',
        backgroundColor: 'rgba(0, 145, 255, 0.2)',
        borderColor: 'rgb(0, 145, 255)',
        borderWidth: 1,
        data: [],
      },
    ],
  });

  const [totalClients, setTotalClients] = useState(0);
  const [totalProjectsByPeriod, setTotalProjectsByPeriod] = useState({
    week: 0,
    month: 0,
    year: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchProjectData = () => {
      const clientsCollection = collection(firestore, 'clients');
      const q = query(clientsCollection);

      return onSnapshot(q, (querySnapshot) => {
        let inProgress = 0;
        let completed = 0;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.completed) {
            completed += 1;
          } else {
            inProgress += 1;
          }
        });
        setProjectData({
          labels: ['In Progress', 'Completed'],
          datasets: [
            {
              label: 'Projects',
              backgroundColor: ['rgb(0, 145, 255)', 'rgb(61, 212, 53) '],
              borderColor: 'rgba(0,0,0,1)',
              borderWidth: 2,
              data: [inProgress, completed],
            },
          ],
        });
      });
    };

    const fetchUpdateData = () => {
      const updatesCollection = collection(firestore, 'updates');
      const q = query(updatesCollection);

      return onSnapshot(q, (querySnapshot) => {
        const updatesCount = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          let date;
          if (data.date.toDate) {
            date = data.date.toDate(); // Firestore Timestamp
          } else {
            date = new Date(data.date); // Fallback for other date formats
          }
          const dateString = date.toLocaleDateString();
          if (!updatesCount[dateString]) {
            updatesCount[dateString] = 0;
          }
          updatesCount[dateString] += 1;
        });

        const labels = Object.keys(updatesCount);
        const data = Object.values(updatesCount);
        setUpdateData({
          labels,
          datasets: [
            {
              label: 'Updates per Day',
              backgroundColor: 'rgba(0, 145, 255, 0.2)',
              borderColor: 'rgb(0, 145, 255)',
              borderWidth: 1,
              data,
            },
          ],
        });
      });
    };

    const fetchTotalClients = () => {
      const clientsCollection = collection(firestore, 'clients');
      const q = query(clientsCollection);

      return onSnapshot(q, (querySnapshot) => {
        setTotalClients(querySnapshot.size);
      });
    };

    const fetchTotalProjectsByPeriod = () => {
      const clientsCollection = collection(firestore, 'clients');
      const q = query(clientsCollection);

      return onSnapshot(q, (querySnapshot) => {
        const today = new Date();
        let total = 0;
        let week = 0;
        let month = 0;
        let year = 0;

        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          let projectDate;
          if (data.date.toDate) {
            projectDate = data.date.toDate(); // Firestore Timestamp
          } else {
            projectDate = new Date(data.date); // Fallback for other date formats
          }
          total += 1;

          if (projectDate >= oneWeekAgo && projectDate <= today) {
            week += 1;
          }
          if (
            projectDate.getMonth() === today.getMonth() &&
            projectDate.getFullYear() === today.getFullYear()
          ) {
            month += 1;
          }
          if (projectDate.getFullYear() === today.getFullYear()) {
            year += 1;
          }
        });

        setTotalProjectsByPeriod({ week, month, year, total });
      });
    };

    const unsubscribeProjectData = fetchProjectData();
    const unsubscribeUpdateData = fetchUpdateData();
    const unsubscribeTotalClients = fetchTotalClients();
    const unsubscribeTotalProjectsByPeriod = fetchTotalProjectsByPeriod();

    return () => {
      if (unsubscribeProjectData) unsubscribeProjectData();
      if (unsubscribeUpdateData) unsubscribeUpdateData();
      if (unsubscribeTotalClients) unsubscribeTotalClients();
      if (unsubscribeTotalProjectsByPeriod) unsubscribeTotalProjectsByPeriod();
    };
  }, []);

  return (
    <Container className="mt-5 analytics-con">
      <Row className="align-items-center justify-content-between mb-3">
        <Col>
          <h1 className="main-head">Analytics</h1>
        </Col>
      </Row>
      <Row className="gy-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title className='analytics-header'>Project Status:</Card.Title>
              <Bar
                data={projectData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Current Project Status',
                    },
                  },
                }}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title className='analytics-header'>Updates Per Day:</Card.Title>
              <Line
                data={updateData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Daily Updates',
                    },
                  },
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="gy-4 mt-3">
        <Col md={6}>
          <Card className='mega-card'>
            <Card.Body>
              <Card.Title className='analytics-header'>Total Active Clients:</Card.Title>
              <p className="display-6">{totalClients}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className='mega-card'>
            <Card.Body>
              <Card.Title className='analytics-header'>Total Projects by Period:</Card.Title>
              <Row>
                <Col md={3}>
                  <p className='analytics-desc'><strong>Week:</strong> {totalProjectsByPeriod.week}</p>
                </Col>
                <Col md={3}>
                  <p className='analytics-desc'><strong>Month:</strong> {totalProjectsByPeriod.month}</p>
                </Col>
                <Col md={3}>
                  <p className='analytics-desc'><strong>Year:</strong> {totalProjectsByPeriod.year}</p>
                </Col>
                <Col md={3}>
                  <p className='analytics-desc'><strong>Total:</strong> {totalProjectsByPeriod.total}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AnalyticsPage;