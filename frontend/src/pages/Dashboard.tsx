import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";

const Dashboard = () => {
  return (
    <Layout name="Dashboard">
      <h1>Welcome to the Dashboard</h1>
      <h1>Button Test!</h1>
      <div>
        <Button variant="primary">Click Me</Button>
        <Button variant="secondary">Click Me</Button>
        <Button variant="accent">Click Me</Button>
        <Button variant="outline">Click Me</Button>
        <Button variant="danger">Click Me</Button>
      </div>
      <div>
        <Button isLoading={true} variant="primary">Click Me</Button>
        <Button isLoading={true} variant="secondary">Click Me</Button>
        <Button isLoading={true} variant="accent">Click Me</Button>
        <Button isLoading={true} variant="outline">Click Me</Button>
        <Button isLoading={true} variant="danger">Click Me</Button>
      </div>
    </Layout>
  );
};

export default Dashboard;
