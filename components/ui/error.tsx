import { Card } from "./card"

export const PageError = ({ title, description }: { title: string, description: string }) => {
	return (
		<div className="text-center py-16 animate-fade-in">
			<Card className="max-w-md m-auto">
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					{title}
				</h3>
				<p className="text-red-600 mb-4">
					{description}
				</p>
			</Card>
		</div>
	)
}