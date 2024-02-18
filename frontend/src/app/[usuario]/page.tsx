
export default function Page({ params }: { params: { usuario: string } }) { 
    const posts = ['post1', 'post2', 'post3'];
    return (
        <div>
            <h1>{params.usuario}</h1>
            <p>Descrição</p>
            <ul>
                {posts.map((post) => (
                    <li key={post}>{post}</li>
                ))}
            </ul>
        </div>
    );
};
