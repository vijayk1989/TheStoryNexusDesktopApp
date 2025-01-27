import { Link } from "react-router";

export default function App() {
	return (
		<div className="bg-gray-950 w-screen h-screen flex flex-col items-center justify-center gap-5 p-5 text-white">
			<h1 className="text-3xl font-bold">Welcome to the App</h1>
			<Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
				Go to Dashboard
			</Link>
		</div>
	);
}
