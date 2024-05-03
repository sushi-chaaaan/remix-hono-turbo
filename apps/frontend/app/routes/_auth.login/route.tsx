import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"

import { signInSchema, signUpSchema } from "@/app/routes/_auth/form"
import { commitSession, getSession } from "@/app/sessions.server"
import { getApi } from "@/lib/api"
import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { getZodConstraint, parseWithZod } from "@conform-to/zod"
import { Alert, Button, TextInput } from "@mantine/core"
import {
  Form,
  json,
  redirect,
  useActionData,
  useNavigation,
} from "@remix-run/react"
import { FiLogIn } from "react-icons/fi"

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"))
  if (session.has("userName")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/app")
  }

  return json(
    {},
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    },
  )
}

export default function Route() {
  const lastResult = useActionData<typeof action>()
  const navigation = useNavigation()
  const [form, fields] = useForm({
    constraint: getZodConstraint(signUpSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: signInSchema })
    },
    shouldRevalidate: "onInput",
    shouldValidate: "onBlur",
  })
  const isSubmitting = navigation.formAction === "/login"

  return (
    <>
      <h1 className="text-center text-4xl font-bold">Log in to BurnTodo🔥</h1>
      <Form className="space-y-4" method="POST" {...getFormProps(form)}>
        {form.errors && form.errors.length > 0 && (
          <Alert
            classNames={{ message: "text-red-600 text-lg font-semibold" }}
            color="red"
            id={form.errorId}
            variant="light"
          >
            {form.errors}
          </Alert>
        )}
        <fieldset className="space-y-4" disabled={isSubmitting}>
          <TextInput
            autoComplete="username"
            description="Enter your name"
            descriptionProps={{ id: fields.name.descriptionId }}
            error={fields.name.errors}
            label="Name"
            size="lg"
            {...getInputProps(fields.name, {
              ariaDescribedBy: fields.name.descriptionId,
              type: "text",
            })}
          />
          <TextInput
            autoComplete="current-password"
            description="Enter your password"
            descriptionProps={{ id: fields.password.descriptionId }}
            error={fields.password.errors}
            label="Password"
            size="lg"
            {...getInputProps(fields.password, {
              ariaDescribedBy: fields.password.descriptionId,
              type: "password",
            })}
          />
          <Button
            className="w-full font-bold"
            color="cyan"
            disabled={!form.valid}
            leftSection={<FiLogIn />}
            loading={isSubmitting}
            size="lg"
            type="submit"
          >
            Log in
          </Button>
        </fieldset>
      </Form>
    </>
  )
}

export async function action({ context, request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"))
  const api = getApi({ context })
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: signInSchema })
  if (submission.status !== "success") {
    return submission.reply()
  }

  const result = await api.auth.verify
    .$post({ json: submission.value })
    .then((res) => res.json())

  if (result.error) {
    return submission.reply({
      formErrors: [result.error],
    })
  }

  session.set("userName", submission.value.name)
  return redirect("/app", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  })
}
