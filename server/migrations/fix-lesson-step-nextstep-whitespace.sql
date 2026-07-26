-- Trim accidental leading/trailing whitespace in lesson step navigation.
-- Fixes תעלות (lesson code 506) ending early after the 2nd screen because
-- textWithImageExplain1 pointed to " textWithImageExplain23" instead of
-- textWithImageExplain23.

UPDATE "LessonStepsV2" ls
SET steps = sub.normalized
FROM (
  SELECT
    ls2.id,
    (
      SELECT jsonb_agg(
        CASE
          WHEN step ? 'choices' THEN
            jsonb_set(
              step,
              '{choices}',
              COALESCE(
                (
                  SELECT jsonb_agg(
                    CASE
                      WHEN choice ? 'nextStep'
                        AND jsonb_typeof(choice->'nextStep') = 'string'
                      THEN jsonb_set(
                        choice,
                        '{nextStep}',
                        to_jsonb(btrim(choice->>'nextStep'))
                      )
                      ELSE choice
                    END
                  )
                  FROM jsonb_array_elements(step->'choices') AS choice
                ),
                '[]'::jsonb
              )
            )
          ELSE step
        END
      )
      FROM jsonb_array_elements(ls2.steps::jsonb) AS step
    ) AS normalized
  FROM "LessonStepsV2" ls2
) sub
WHERE ls.id = sub.id
  AND ls.steps::text ~ '"nextStep"\s*:\s*"\s';
