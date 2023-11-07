export default function Container
    ({
        children,
    }: {
        children: React.ReactNode;
    }) {
    return (
        <div className="lg:container lg:mx-auto lg:px-[30px] lg:py-[30px] px-[10px] py-[15px]" suppressHydrationWarning={true}>
            {children}
        </div>
    );
};
