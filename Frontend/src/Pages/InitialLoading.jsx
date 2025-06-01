export default function InitialLoading() {
    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <h1>Jarvis</h1>
            <p style={{ marginTop: 2, marginBottom: 2 }}>welcome to your personal AI assistant</p>
            <p>loading .... </p>
        </div>
    )
}