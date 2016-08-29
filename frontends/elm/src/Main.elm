import String exposing (toInt)
import Html exposing (Html, button, input, div, form, text)
import Html.App as App
import Html.Events exposing (onClick, onInput)
import Html.Attributes exposing (type')

main: Program Never
main =
    App.beginnerProgram { model = 0, view = view, update = update }


type Msg = Increment | Decrement | SetValue String


update : Msg -> Int -> Int
update msg model =
  case msg of
    Increment ->
      model + 1

    Decrement ->
      model - 1

    SetValue s ->
      case toInt s of
        Ok x ->
          x

        Err _ ->
          0


view : a -> Html Msg
view model =
  form []
    [ input [ type' "text", onInput SetValue ] [ text "-" ],
      text <| toString model
    ]
