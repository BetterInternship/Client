export const HeaderText = ({ children }: { children: React.ReactNode }) => {
	return (
		<h1 className="text-4xl font-bold tracking-tight">
			{children}
		</h1>
	)	
}

export const HeaderIcon = (props: { icon: React.ComponentType<{ className: string }> }) => {
	return (
		<div className="w-8 h-8 bg-primary rounded-[0.25em] flex items-center justify-center flex-shrink-0">
			<props.icon className="w-4 h-4 text-white" />
		</div>
	)
}
