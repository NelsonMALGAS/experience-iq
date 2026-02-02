

const IssueDeatilsPage = async ({
    params,
}: {
    params: Promise<{ id: string }>
}) => {

    const { id } = await params
    return (
        <div className="mt-24">IssueDeatilsPage - {id}</div>
    )
}

export default IssueDeatilsPage