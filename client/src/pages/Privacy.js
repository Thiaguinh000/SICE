import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <main className="eco-layout" style={{
      backgroundImage: "url('/fundodosoftware.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <article className="eco-card eco-card-large">
        <h1 className="eco-title-primary mb-2">Privacidade</h1>
        <p className="text-muted">Informações sobre os dados tratados pelo SICE.</p>
        <h2 className="h5 eco-title-accent">Dados e finalidade</h2>
        <p>O SICE utiliza nome e e-mail para autenticar a conta; endereço, data e horário para organizar a coleta; e detalhes dos equipamentos para planejar sua destinação.</p>
        <h2 className="h5 eco-title-accent">Acesso e compartilhamento</h2>
        <p>Dados de coleta ficam disponíveis à equipe administrativa responsável pela operação. Ao abrir a localização pelo mapa, o endereço é enviado ao Google Maps, conforme os termos e a política de privacidade do Google.</p>
        <h2 className="h5 eco-title-accent">Exclusão da conta</h2>
        <p>Ao excluir a conta, o perfil é removido e o histórico operacional é mantido sem associação ao titular; endereço e observações pessoais são removidos.</p>
        <div className="alert alert-warning">
          Esta versão acadêmica não define o controlador institucional, canal de contato ou prazo de retenção. Esses dados devem ser confirmados com a instituição responsável antes de disponibilizar o sistema ao público.
        </div>
        <Link className="btn-eco-secondary" to="/">Voltar ao início</Link>
      </article>
    </main>
  );
}
