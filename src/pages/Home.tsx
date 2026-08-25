import { NavLink } from 'react-router-dom'
import image from '../assets/campanha-01-07.jpeg'


export default function Home() {
  return (
    <div className="w-full h-full overflow-hidden">
      <NavLink to="/forms">
        <img
        src={image}
        className="w-full h-screen object-contain">
        </img>
      </NavLink>
    </div>
  )
}