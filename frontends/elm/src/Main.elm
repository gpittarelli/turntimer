import String exposing (toInt)
import Html exposing (Html, button, input, div, form, text, label, br)
import Html.App as App
import Html.Events exposing (onClick, onInput)
import Html.Attributes exposing (type')


type alias State =
  { name : String
  , group : Result String Int
  , turnTime : Result String Int
  }


initialState : State
initialState =
  { name = ""
  , group = Ok 0
  , turnTime = Ok 0 }


type Msg = SetName String | SetGroup String | SetTurnTime String


main: Program Never
main =
    App.beginnerProgram { model = initialState, view = view, update = update }


update : Msg -> State -> State
update msg model =
  case msg of
    SetName name ->
      { model | name = name }

    SetGroup group ->
      { model | group = toInt group }

    SetTurnTime turnTime ->
      { model | turnTime = toInt turnTime }


view : State -> Html Msg
view {name, group, turnTime} =
  form []
    [ label []
        [ text "Name"
        , input [ type' "text", onInput SetName ] []
        ]
    , text name
    , br [] []
    , label []
        [ text "Group Id"
        , input [ type' "number", onInput SetGroup ] []
        ]
    , text (case group of
               Ok x -> toString x
               Err e -> e)
    , br [] []
    , label []
        [ text "Turn Time"
        , input [ type' "number", onInput SetTurnTime ] []
        ]
    , text (case turnTime of
               Ok x -> toString x
               Err e -> e)
    ]
