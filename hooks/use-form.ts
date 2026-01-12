"use client"

import type React from "react"

import { useState, useCallback } from "react"

interface UseFormOptions<T> {
  initialValues: T
  onSubmit?: (values: T) => void | Promise<void>
  validate?: (values: T) => Record<string, string>
}

export function useForm<T extends Record<string, unknown>>(options: UseFormOptions<T>) {
  const { initialValues, onSubmit, validate } = options
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target
      const finalValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value
      setValues((prev) => ({ ...prev, [name]: finalValue }))
    },
    [],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const validationErrors = validate?.(values)
      setErrors(validationErrors || {})

      if (validationErrors && Object.keys(validationErrors).length > 0) return

      try {
        setIsSubmitting(true)
        await onSubmit?.(values)
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, validate, onSubmit],
  )

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
  }, [initialValues])

  return { values, errors, handleChange, handleSubmit, resetForm, isSubmitting, setValues }
}
