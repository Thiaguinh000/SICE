export function Loading({ label = 'Carregando...' }) {
  return <p role="status" className="text-muted py-4">{label}</p>;
}

export function ErrorMessage({ children }) {
  return children ? <div className="alert alert-danger" role="alert">{children}</div> : null;
}

export function EmptyState({ children }) {
  return <div className="alert alert-info" role="status">{children}</div>;
}
