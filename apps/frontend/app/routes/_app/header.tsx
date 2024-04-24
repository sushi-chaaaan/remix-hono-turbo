import Container from "@/app/routes/_app/Container"
import { Link } from "@remix-run/react"
import { tv } from "tailwind-variants"

const styles = tv({
  slots: {
    title: "text-2xl",
    wrapper: "bg-white",
  },
})

const css = styles()

const Header = () => {
  return (
    <header className={css.wrapper()}>
      <Container>
        <p className={css.title()}>
          <Link to="/">A Todo App.</Link>
        </p>
      </Container>
    </header>
  )
}

export default Header
