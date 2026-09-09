import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { PetrogasApp } from './PetrogasApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PetrogasApp />
  </StrictMode>,
)
