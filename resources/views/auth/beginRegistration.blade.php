@extends('layouts.pivot')

@section('content')

<form class="w75 textLeft" role="form" method="POST" action="{{ route('register') }}">
    {{ csrf_field() }}
  <div class="table row-spacing1 w100" id="register">

    @if ($errors->has('email'))
    <div class="w100">
        <label class="w33 label0 textRight"></label>
        <div class="w67 textLeft">
          <div class="w67 text2">{{ $errors->first('email') }}</div>
        </div>
    </div>
    @endif

    <div class="w100{{ $errors->has('email') ? ' has-error' : '' }}">
        <label for="email" class="w33 label0 textRight">E-Mail Address</label>

        <div class="w67 textLeft">
            <input id="email" type="email" class="w67" name="email" value="{{ $email }}" required autofocus/>

        </div>
    </div>


    <div class="w100">
        <div></div>
            <div>
              <button type="submit">
                  Register
              </button>
            </div>
        </div>
    </div>
</form>

@endsection

@section('scripts')

<!-- <script src="{{ asset('js/dragula/dragula.js') }}"></script> -->
<script src="{{ asset('js/pivotlib.js') }}"></script>
<!-- <script src="{{ asset('js/pivotWorkspace.js') }}"></script> -->
<script src="{{ asset('js/register.js') }}"></script>

@endsection
