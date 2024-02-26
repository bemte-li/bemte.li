import Rodape from "@/components/rodape";

export default function Page({ params }: { params: { usuario: string, postagem: string } }) {
    return (
        <div>
            <h1>Postagem {params.postagem} do usuário {params.usuario}</h1>
            <p>Corpo do texto</p>
            <Rodape />
        </div>
    );
};
