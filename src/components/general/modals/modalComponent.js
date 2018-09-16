import React from 'react'
import './modalComponent.css'

function Modal({
  children,
  heading,
  toggleModal
}) {
  if (!Array.isArray(children)) {
    children = [children]
  }

  const body = children.find(function(child) {
    return child.key.includes('modal-body');
  })

  const footer = children.find(function(child) {
    return child.key.includes('modal-footer');
  })

  return (
    <div className="modal-component">
      <div className="backdrop" onClick={toggleModal}/>
      <div className="container">

        {heading && (
          <header className="modal-header">
            <h2 className="heading">{heading}</h2>
          </header>
        )}

        <main className="modal-body">
          {body}
        </main>

        <footer className="modal-footer">
          {footer}
        </footer>

      </div>
    </div>
  )
}

export default Modal
