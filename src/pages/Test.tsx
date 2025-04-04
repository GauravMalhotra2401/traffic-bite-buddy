import { AddressAutofill } from '@mapbox/search-js-react';

const MyAddressForm = () => {
  return (
    <form>
      <AddressAutofill
        accessToken='pk.eyJ1IjoidGVzdGluZ2JybyIsImEiOiJjbTkzMnRia3EwZ3E5MmtyNG9mbm1icTY4In0.2GNGgL3GHFrv5uqnToZ3Iw'
      >
        <input type="text" name="address-2" autocomplete="address-line2" />
        {/* <input type="text" name="address-1" autocomplete="address-line1" /> */}
        {/* <input type="text" name="city" autocomplete="address-level2" />
        <input type="text" name="state" autocomplete="address-level1" />
        <input type="text" name="zip" autocomplete="postal-code" /> */}
      </AddressAutofill>
    </form>
  )
}

export default MyAddressForm
