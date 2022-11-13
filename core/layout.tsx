import { ComponentChild } from "preact"

export const Layout = (props: { children: ComponentChild, head?: ComponentChild }) => {
  return (
    <html>
      <head>
        <script
          src="https://unpkg.com/htmx.org@1.8.4"
          integrity="sha384-wg5Y/JwF7VxGk4zLsJEcAojRtlVp1FKKdGy1qN+OMtdq72WRvX/EdRdqg/LOhYeV"
          crossOrigin="anonymous">
        </script>
        {props.head}
      </head>
      <body>
        {props.children}
      </body>
    </html>
  )
}
